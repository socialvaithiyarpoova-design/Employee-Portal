const ENV = "DEV";

const configs = {
  LOCAL: {
    apiBaseUrl: "http://localhost:3001/",
    apiBaseUrlpy: "https://dev-py.vaithiyarpoovafoundation.com/"
  },
  DEV: {
    apiBaseUrl: "https://dev-api.vaithiyarpoovafoundation.com/",
    apiBaseUrlpy: "https://dev-py.vaithiyarpoovafoundation.com/"
  },
  PROD: {
    apiBaseUrl: "https://api.vaithiyarpoovafoundation.com/",
    apiBaseUrlpy: "https://py.vaithiyarpoovafoundation.com/"
  }
};

const config = () => configs[ENV];

const configModule = { config };

export default configModule;

