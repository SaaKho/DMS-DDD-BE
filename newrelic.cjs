exports.config = {
    app_name: ["DMS"],
    license_key: "98ee43c4aa8b71f58036459b84ce988eFFFFNRAL",
    allow_all_headers: true,
    attributes: {
      exclude: [
        "request.headers.cookie",
        "request.headers.authorization",
        "request.headers.proxyAuthorization",
        "request.headers.setCookie*",
        "request.headers.x*",
        "response.headers.cookie",
        "response.headers.authorization",
        "response.headers.proxyAuthorization",
        "response.headers.setCookie*",
        "response.headers.x*",
      ],
    },
    application_logging: {
      forwarding: {
        enabled: true,
        max_samples_stored: 10000,
      },
    },
  };
  