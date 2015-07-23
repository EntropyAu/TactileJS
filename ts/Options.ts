module Tactile {
  export interface AnimationOptions {
    duration?:number;
    easing?:string|number[];
  }
  export interface Options {
    cancel:string;
    helperResize:boolean;
    helperCloneStyles:boolean;
    animation:boolean;
    revertBehaviour:string
    pickUpAnimation:AnimationOptions,
    pickDownAnimation:AnimationOptions,
    resizeAnimation:AnimationOptions,
    dropAnimation:AnimationOptions,
    reorderAnimation:AnimationOptions,
    deleteAnimation:AnimationOptions,
    containerResizeAnimation:AnimationOptions,
    pickUpDelay:number,
    pickUpDistance:number,
    helperRotation:number,
    helperShadowSize:number,
    placeholderStyle:string,
    placeholderClass:string,
    containerHoverClass:string,
    scrollSensitivity:string|number,
    scrollSpeed:number
  };

  export var defaultOptions:Options = {
    cancel: 'input,textarea,a,button,select,[data-drag-placeholder]',
    helperResize: true,
    helperCloneStyles: false,
    animation: true,
    revertBehaviour:   'last', // original, last
    pickUpAnimation:           { duration: 300, easing: 'ease-in-out' },
    pickDownAnimation:         { duration: 300, easing: 'ease-in-out' },
    resizeAnimation:           { duration: 300, easing: 'ease-in-out' },
    dropAnimation:             { duration: 300, easing: 'ease-in-out' },
    reorderAnimation:          { duration: 300, easing: 'ease-in-out' },
    deleteAnimation:           { duration: 300, easing: 'ease-out'    },
    containerResizeAnimation:  { duration: 300, easing: 'ease-in' },
    pickUpDelay: 0,
    pickUpDistance: 0,
    helperRotation: -1,
    helperShadowSize: 15,
    placeholderStyle: 'clone',
    placeholderClass: 'dd-drag-placeholder',
    containerHoverClass: 'dd-drag-hover',
    scrollSensitivity: '20%',
    scrollSpeed: 1
  };
}
