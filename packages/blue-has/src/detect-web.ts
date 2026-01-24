import detectJavaScriptAPIs from './javascript/detect-apis';
import detectWebAPIs from './web/detect-apis';

export default () => {
    detectJavaScriptAPIs();
    detectWebAPIs();
};
