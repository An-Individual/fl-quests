import { RequestInterceptor } from "./qualities/request-interceptor.js";
import { StyleInjector } from "./interface/style-injector.js";
import { ModalInjector } from "./interface/modal-injector.js";
import { ButtonInjector } from "./interface/button-injector.js";

RequestInterceptor.listenForInterceptions();
StyleInjector.injectStyles();
ModalInjector.injectModalHtml();
ButtonInjector.startButtonObserver();