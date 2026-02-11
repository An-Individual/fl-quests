import { RequestInterceptor } from "./qualities/request-interceptor";
import { StyleInjector } from "./interface/style-injector";
import { ModalInjector } from "./interface/modal-injector";
import { ButtonInjector } from "./interface/button-injector";

RequestInterceptor.injectInterceptors();
StyleInjector.injectStyles();
ModalInjector.injectModalHtml();
ButtonInjector.startButtonObserver();