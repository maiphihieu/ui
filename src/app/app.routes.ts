import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './Layout/Admin-layout/admin-layout.component';
import { authGuard } from './Auth Guard/auth.guard';

export const routes: Routes = [
    //===client===
    {
        path: ':token',
        loadComponent: () => import('./Components/client/home/home.component').then(m => m.HomeComponent)
    },
    {

        path: '',
        loadComponent: () => import('./Components/client/invalid-token/invalid-token.component').then(m => m.InvalidTokenComponent)
    },
    {
        path: 'menu/:token',
        loadComponent: () => import('./Components/client/menu/menu.component').then(m => m.MenuComponent)
    },
    {
        path: 'cart/:token',
        loadComponent: () => import('./Components/client/cart/cart.component').then(m => m.CartComponent)
    },

    {
        path: 'admin/login',
        loadComponent: () =>
            import('./Components/admin/Auth/login/login.component').then(m => m.LoginComponent)
    },
    // ===admin===
    {
        path: 'admin',
        canActivate: [authGuard],
        component: AdminLayoutComponent,
        children: [
            { path: '', redirectTo: 'stores', pathMatch: 'full' },
            // ===Store===
            {
                path: 'stores',
                loadComponent: () =>
                    import('./Components/admin/store/store-list/store-list.component').then(m => m.StoreListComponent),
               data: { animation: '1' }
            },
            {
                path: 'stores/new',
                loadComponent: () =>
                    import('./Components/admin/store/store-form/store-form.component').then(m => m.StoreFormComponent)
              
            },
            {
                path: 'stores/edit/:id',
                loadComponent: () =>
                    import('./Components/admin/store/store-form/store-form.component').then(m => m.StoreFormComponent)
           
            },

            // ===Branch===
            {
                path: 'branches',
                loadComponent: () =>
                    import('./Components/admin/branch/branch-list/branch-list.component').then(m => m.BranchListComponent),
                data: { animation: '2' }
            },
            {
                path: 'branches/new',
                loadComponent: () =>
                    import('./Components/admin/branch/branch-form/branch-form.component').then(m => m.BranchFormComponent)
          
            },
            {
                path: 'branches/edit/:id',
                loadComponent: () =>
                    import('./Components/admin/branch/branch-form/branch-form.component').then(m => m.BranchFormComponent)
                
            },
             //===Category===
            {
                path: 'categories',
                loadComponent: () =>
                    import('./Components/admin/category/category-list/category-list.component').then(m => m.CategoryListComponent),
                data: { animation: '3' }
            },
            {
                path: 'categories/new',
                loadComponent: () =>
                    import('./Components/admin/category/categori-form/category-form.component').then(m => m.CategoryFormComponent)
              
            },
            {
                path: 'categories/edit/:id',
                loadComponent: () =>
                    import('./Components/admin/category/categori-form/category-form.component').then(m => m.CategoryFormComponent)
              
            },

            // ===Product===
            {
                path: 'products',
                loadComponent: () =>
                    import('./Components/admin/product/product-list/product-list.component').then(m => m.ProductListComponent),
                data: { animation: '4' }
            },

            {
                path: 'products/new',
                loadComponent: () =>
                    import('./Components/admin/product/product-form/product-form.component').then(m => m.ProductFormComponent)
            
            },
            {
                path: 'products/edit/:id',
                loadComponent: () =>
                    import('./Components/admin/product/product-form/product-form.component').then(m => m.ProductFormComponent)
            
            },
           

            //===Table===
            {
                path: 'tables',
                loadComponent: () =>
                    import('./Components/admin/Table/Table-list/table-list.component').then(m => m.TableListComponent),
                data: { animation: '5' }
            },
            {
                path: 'tables/new',
                loadComponent: () =>
                    import('./Components/admin/Table/Table-form/table-form.component').then(m => m.TableFormComponent),
                
            },
            {
                path: 'tables/edit/:id',
                loadComponent: () =>
                    import('./Components/admin/Table/Table-form/table-form.component').then(m => m.TableFormComponent),
                
            },
            //===Order===
            {
                path: 'orders',
                loadComponent: () =>
                    import('./Components/admin/order/order-list/order-list.component').then(m => m.OrderListComponent),
                data: { animation: '6' }
            },
            // ===User===
            {
                path: 'users',
                loadComponent: () =>
                    import('./Components/admin/User/UserListComponent/user-list.component').then(m => m.UserListComponent),
                data: { animation: '7' }
            },
            {
                path: 'users/new',
                loadComponent: () =>
                    import('./Components/admin/User/UserFormComponent/user-form.component').then(m => m.UserFormComponent)
            
            },
            {
                path: 'users/edit/:id',
                loadComponent: () =>
                    import('./Components/admin/User/UserFormComponent/user-form.component').then(m => m.UserFormComponent)
            
            },


        ]
    }
];
