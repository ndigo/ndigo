import detectJavaScriptAPIs from './javascript/detect-apis';
import detectNodeAPIs from './node/detect-apis';

export default () => {
    detectJavaScriptAPIs();
    detectNodeAPIs();
};
