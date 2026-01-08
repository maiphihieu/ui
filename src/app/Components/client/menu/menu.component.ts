import { Component, OnInit, ViewChild, ViewChildren, ElementRef, QueryList, AfterViewInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, CommonModule, DecimalPipe } from '@angular/common'; // Sửa lại import
import { Menu } from '../../../../Models/menu.model';
import { Product } from '../../../../Models/product.model';
import { TableService } from '../../../../Services/table.service';
import { StoreService } from '../../../../Services/store.service';
import { CartService } from '../../../../Services/Cart.Service';
import { Category } from '../../../../Models/category.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ProductDetailModalComponent } from '../ProductDetailModal/product-detail-modal.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, DecimalPipe, FormsModule, AsyncPipe, ProductDetailModalComponent, CommonModule], // Sửa lại imports
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, AfterViewInit {
  token: string | null = null;
  isLoading = true;
  menuData: Menu[] = [];
  selectedCategory: Category | null = null;
  searchTerm: string = '';
  searchResults: Product[] = [];
  private searchSubject = new Subject<string>();
  isCategoryModalVisible = false;
  isDetailModalVisible = false;
  productForDetail: Product | null = null;

  @ViewChild('slider') slider!: ElementRef<HTMLElement>;
  @ViewChildren('categoryLink') categoryLinks!: QueryList<ElementRef<HTMLAnchorElement>>;
  @ViewChildren('categoryTitle') categoryTitles!: QueryList<ElementRef<HTMLHeadingElement>>;
  @ViewChild('productListContainer') productListContainer!: ElementRef<HTMLElement>;
  @ViewChild('categoryTabs') categoryTabs!: ElementRef<HTMLElement>;
  private isClickScrolling = false;
  constructor(
    private route: ActivatedRoute,
    private tableService: TableService,
    private storeService: StoreService,
    public cartService: CartService
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    if (!this.token) return;
    this.cartService.loadCartForTable(this.token);
    this.tableService.getTableByToken(this.token).subscribe(tableData => {
      this.loadFullMenu(tableData.storeId);
    });

    this.searchSubject.pipe(
      debounceTime(300), // Chờ 300ms sau khi người dùng ngừng gõ
      distinctUntilChanged() // Chỉ tìm khi giá trị thay đổi
    ).subscribe(searchValue => {
      this.filterProducts(searchValue);
    });


  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  filterProducts(searchValue: string): void {
    this.searchResults = [];
    if (!searchValue) {
      return; // Nếu ô tìm kiếm trống thì không làm gì
    }

    const lowerCaseSearch = searchValue.toLowerCase();

    const allProducts: Product[] = [];
    this.menuData.forEach(section => {
      section.products.forEach(product => {
        if (product.name.toLowerCase().includes(lowerCaseSearch)) {
          allProducts.push(product);
        }
      });
    });

    this.searchResults = allProducts;
  }

  ngAfterViewInit(): void {
    this.categoryLinks.changes.subscribe(() => {
      const initialIndex = 0;
      this.selectedCategory = { id: this.menuData[initialIndex].categoryId, name: this.menuData[initialIndex].categoryName, logoUrl: '' };
      this.moveSlider(initialIndex);
    });
  }

  loadFullMenu(storeId: number): void {
    this.storeService.getFullMenu(storeId).subscribe(data => {
      setTimeout(() => {
        this.menuData = data;
        if (data.length > 0) {
          this.selectedCategory = { id: data[0].categoryId, name: data[0].categoryName, logoUrl: '' };
        }
        this.isLoading = false;
      }, 0);
    });
  }

  onScroll(event: Event): void {
    if (this.isClickScrolling) return;

    const container = event.target as HTMLElement;
    const offset = 100;
    const scrollTop = container.scrollTop + offset;

    let activeIndex = 0;
    for (let i = 0; i < this.categoryTitles.length; i++) {
      const titleEl = this.categoryTitles.toArray()[i].nativeElement;
      if (titleEl.offsetTop <= scrollTop) {
        activeIndex = i;
      }
    }

    const newCategoryId = this.menuData[activeIndex].categoryId;
    if (this.selectedCategory?.id !== newCategoryId) {
      this.selectedCategory = { id: newCategoryId, name: this.menuData[activeIndex].categoryName, logoUrl: '' };
      this.moveSlider(activeIndex);
    }
  }
  scrollToCategory(categoryId: number, index: number): void {
    this.isClickScrolling = true;
    this.selectedCategory = { id: categoryId, name: this.menuData[index].categoryName, logoUrl: '' };
    this.moveSlider(index);

    const element = document.getElementById('category-' + categoryId);
    if (element && this.productListContainer) {

      const headerOffset = 100;
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      this.productListContainer.nativeElement.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setTimeout(() => { this.isClickScrolling = false; }, 500);
    } else {
      this.isClickScrolling = false;
    }
  }

  moveSlider(index: number): void {
    const activeTab = this.categoryLinks.toArray()[index]?.nativeElement;
    if (activeTab && this.slider) {
      this.slider.nativeElement.style.width = `${activeTab.offsetWidth}px`;
      this.slider.nativeElement.style.left = `${activeTab.offsetLeft}px`;
    }

    const tabsContainer = this.categoryTabs?.nativeElement;
    if (activeTab && tabsContainer) {
      const containerCenter = tabsContainer.clientWidth / 2;
      const tabCenter = activeTab.offsetLeft + activeTab.offsetWidth / 2;
      const scrollLeft = tabCenter - containerCenter;
      tabsContainer.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }

  addToCart(product: Product): void {
    if (this.token) {
      this.cartService.addItem(product, this.token);
    }
  }

  openCategoryModal(): void {
    this.isCategoryModalVisible = true;
  }

  closeCategoryModal(): void {
    this.isCategoryModalVisible = false;
  }

  selectCategoryFromModal(categoryId: number, index: number): void {
    this.scrollToCategory(categoryId, index);
    this.closeCategoryModal();
  }

  getQuantity(productId: number): number {
    const item = this.cartService.getCartItems().find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  }

  increaseQuantity(product: Product): void {
    if (this.token) {
      this.cartService.changeQuantity(product.id, 1, this.token);
    }
  }

  decreaseQuantity(product: Product): void {
    if (this.token) {
      this.cartService.changeQuantity(product.id, -1, this.token);
    }
  }

  openDetailModal(product: Product): void {
    this.productForDetail = product;
    this.isDetailModalVisible = true;
  }

  closeDetailModal(): void {
    this.isDetailModalVisible = false;
    this.productForDetail = null;
  }


  handleAddToCartFromModal(event: { product: Product, quantity: number, note: string }): void {
    // Luôn kiểm tra xem token có tồn tại không
    if (this.token) { 
        for (let i = 0; i < event.quantity; i++) {
            // Thêm this.token vào làm tham số thứ hai
            this.cartService.addItem(event.product, this.token);
        }
    }
    this.closeDetailModal();
}
}