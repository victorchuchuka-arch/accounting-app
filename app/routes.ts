import { type RouteConfig, layout, index , route} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/dashboard.tsx"),
   route("products", "routes/products.tsx"), 
   route("sales", "routes/sales.tsx"),
   route("customers", "routes/customers.tsx"),
  ]),
] satisfies RouteConfig;