import detectJavaScriptAPIs from './javascript/detect-apis';
import detectNodeAPIs from './node/detect-apis';
import detectWebAPIs from './web/detect-apis';

export default () => {
    detectJavaScriptAPIs();
    detectNodeAPIs();
    detectWebAPIs();
};
