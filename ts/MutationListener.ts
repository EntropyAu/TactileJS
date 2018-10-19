module Tactile {

  export class MutationListener {
    private _mutObserver: MutationObserver;

    private _initializeMutationListener():void {
      if (!window["MutationObserver"]) return;
      this._mutObserver = new MutationObserver(this._onMutation.bind(this));
      this._mutObserver.observe(document.body, { childList: true, subtree: true });
    }


    private _onMutation(e):void {
      console.log("_onMutation", e);
    }


    public dispose() {
      if (this._mutObserver) {
        this._mutObserver.disconnect();
        this._mutObserver = null;
      }
    }
  }
}
