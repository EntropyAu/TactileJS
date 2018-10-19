module Tactile {
  export interface AnimationOptions {
    duration?:number;
    easing?:string|number[];
  }
  export interface Options {
    cancel?:string;
    helperResize?:boolean;
    helperCloneStyles?:boolean;
    animation?:boolean;
    revertBehaviour?:string; // 'origin' or 'last'
    pickUpAnimation?:AnimationOptions;
    pickDownAnimation?:AnimationOptions;
    resizeAnimation?:AnimationOptions;
    dropAnimation?:AnimationOptions;
    reorderAnimation?:AnimationOptions;
    deleteAnimation?:AnimationOptions;
    containerResizeAnimation?:AnimationOptions;
    pickUpDelay?:number;
    pickUpDistance?:number;
    helperRotation?:number;
    helperShadowSize?:number;
    placeholderClass?:string;
    avoidDomMutations?:boolean;
    scrollAutoDetect?:boolean;
    scrollSensitivity?:string|number; // 'number in px, or 15%'
    scrollSpeed?:number;
  };

  export var defaults:Options = {
    cancel:                    'input,textarea,a,button,select',
    helperResize:              true,
    helperCloneStyles:         true,
    animation:                 true,
    revertBehaviour:           'last', // original, last
    pickUpAnimation:           { duration: 300, easing: 'ease-in-out' },
    pickDownAnimation:         { duration: 300, easing: 'ease-in-out' },
    resizeAnimation:           { duration: 600, easing: 'ease-in-out' },
    dropAnimation:             { duration: 300, easing: 'ease-in-out' },
    reorderAnimation:          { duration: 300, easing: 'ease-in-out' },
    deleteAnimation:           { duration: 300, easing: 'ease-in-out' },
    containerResizeAnimation:  { duration: 300, easing: 'ease-in-out' },
    pickUpDelay:               100, // null means never, 0 means instant, > 0 means on timer
    pickUpDistance:            10, // null means never pickup due to dragging, 0 means instant, > 0 means as expected
    helperRotation:            -2, // degrees
    helperShadowSize:          25,
    placeholderClass:          'tactile-drag-placeholder',
    avoidDomMutations:         true,
    scrollAutoDetect:          true,
    scrollSensitivity:         '15%',
    scrollSpeed:               1
  };
}
