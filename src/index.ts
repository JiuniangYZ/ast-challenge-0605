import { parse, ParserPlugin } from '@babel/parser';
import traverse from '@babel/traverse';

const code = `
export interface UsePoolsQuery<TData> extends ReactQueryParams<QueryPoolsResponse, TData> {
    request?: QueryPoolsRequest;
}
const usePools = <TData = QueryPoolsResponse,>({
    request,
    options
}: UsePoolsQuery<TData>) => {
    return useQuery<QueryPoolsResponse, Error, TData>(["poolsQuery", request], () => {
        if (!queryService) throw new Error("Query Service not initialized");
        return queryService.pools(request);
    }, options);
};
`
export type Params = {
  queryInterface: string;
  hookName: string;
  requestType: string;
  responseType: string;
  queryServiceMethodName: string;
  keyName: string;
}

const methodCatcher = /([A-Za-z_0-9]+)\.([A-Za-z_0-9]+)\(\)/

export default (params: Params) => {
  const plugins = [
    'objectRestSpread',
    'classProperties',
    'optionalCatchBinding',
    'asyncGenerators',
    'decorators-legacy',
    'typescript',
    'dynamicImport'
  ] as ParserPlugin[];

  const {
    queryInterface,
    hookName,
    requestType,
    responseType,
    queryServiceMethodName,
    keyName
  } = params;
  const __ = methodCatcher.exec(queryServiceMethodName);
  if (!__) {
    throw new Error(`${queryServiceMethodName} is not a valid method name`)
  }
  const objectName = __[1];
  const propertyName = __[2];

  const ast = parse(code, {
    sourceType: 'module',
    plugins
  });

  traverse(ast as any, {
    enter(path) {
      if (path.isIdentifier({ name: "QueryPoolsResponse" })) {
        path.node.name = responseType
      } else if (path.isIdentifier({ name: "QueryPoolsRequest" })) {
        path.node.name = requestType
      } else if (path.isIdentifier({ name: "UsePoolsQuery" })) {
        path.node.name = queryInterface;
      } else if (path.isIdentifier({ name: "usePools" })) {
        path.node.name = hookName
      } else if (path.isStringLiteral({ value: "poolsQuery" })) {
        path.node.value = keyName
      } else if (path.isIdentifier({ name: "pools" })) {
        path.node.name = propertyName
      } else if (path.isIdentifier({ name: "queryService" })) {
        path.node.name = objectName
      }
    }
  })

  return ast
};
