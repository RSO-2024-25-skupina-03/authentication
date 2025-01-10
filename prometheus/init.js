
import promBundle from "express-prom-bundle";

promBundle.normalizePath = (req, opts) => {
    return req.route?.path ?? "No";
};
// Init metrics
const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
    buckets: [0.001, 0.01, 0.1, 1, 2, 3, 5, 7, 10, 15, 20, 25, 30, 35, 40, 50, 70, 100, 200],
    customLabels: { model: "No" },
    transformLabels: (labels, req, res) => {
        labels.model = req?.body?.model ?? req?.body?.imageModel ?? req?.body?.voice ?? "No";
        return labels;
    },
});

export default metricsMiddleware;

/*
This instruments our app to track request rates, durations, response sizes, and more. Default process metrics are also collected.

The metrics are exposed on /metrics for Prometheus to scrape. We can also add custom metrics and labels as needed. For example, I have created a model label — because almost all my AI calls have this req.body parameter and I’m really interested in timing comparison.

This module makes instrumenting Express apps for Prometheus a breeze! The generated metrics can then be visualized in Grafana without any additional work.

This app exports a /metrics route that exposes Prometheus metric data. We create a histogram to track HTTP request durations and use middleware timing on our main data route. I really suggest histogram over summary — then you will have much less pain in Grafana Query Editor.
 */