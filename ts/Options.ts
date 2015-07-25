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
    avoidDomMutations:boolean,
    scrollSensitivity:string|number,
    scrollSpeed:number
  };

  export var defaults:Options = {
    cancel: 'input,textarea,a,button,select',
    helperResize: true,
    helperCloneStyles: false,
    animation: true,
    revertBehaviour: 'last', // original, last
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
    placeholderClass: 'tactile-drag-placeholder',
    containerHoverClass: 'tactile-drag-hover',
    avoidDomMutations: true,
    scrollSensitivity: '15%',
    scrollSpeed: 1
  };
}
