import { trigger, transition, style, query, group, animate } from '@angular/animations';


const slideTo = (direction: 'left' | 'right') => {
  const optional = { optional: true };
  return [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        [direction]: 0,
        width: '100%'
      })
    ], optional),
    query(':enter', [
      style({ [direction]: '-100%' })
    ]),
    group([
      query(':leave', [
        animate('900ms ease-in-out', style({ [direction]: '100%', opacity: 0 }))
      ], optional),
      query(':enter', [
        animate('900ms ease-in-out', style({ [direction]: '0%' }))
      ])
    ]),
  ];
};

export const slideInAnimation = trigger('routeAnimations', [
  transition('1 => 2, 1 => 3, 1 => 4, 1 => 5, 1 => 6, 1 => 7', slideTo('right')),
  transition('2 => 3, 2 => 4, 2 => 5, 2 => 6, 2 => 7', slideTo('right')),
  transition('3 => 4, 3 => 5, 3 => 6, 3 => 7', slideTo('right')),
  transition('4 => 5, 4 => 6, 4 => 7', slideTo('right')),
  transition('5 => 6, 5 => 7', slideTo('right')),
  transition('6 => 7', slideTo('right')),
  transition('7 => 6, 7 => 5, 7 => 4, 7 => 3, 7 => 2, 7 => 1', slideTo('left')),
  transition('6 => 5, 6 => 4, 6 => 3, 6 => 2, 6 => 1', slideTo('left')),
  transition('5 => 4, 5 => 3, 5 => 2, 5 => 1', slideTo('left')),
  transition('4 => 3, 4 => 2, 4 => 1', slideTo('left')),
  transition('3 => 2, 3 => 1', slideTo('left')),
  transition('2 => 1', slideTo('left')),
]);