// @ts-nocheck because the variables that we're testing against don't exist by default

// Our supported browsers
export enum Browser {
  firefox,
  chromium,
}

let b: Browser;
if (typeof InstallTrigger !== "undefined") b = Browser.firefox;
else if (!!window.chrome) b = Browser.chromium;
export const browser = b;
