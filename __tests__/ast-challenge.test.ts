import createAst, { Params } from '../src/index'
import generate from '@babel/generator';

const expectCode = (ast) => {
  expect(
    generate(ast).code
  ).toMatchSnapshot();
}

it('code-challenge', () => {
  const ast = createAst({
    queryInterface: 'useCustomQuery',
    hookName: 'customHook',
    requestType: 'customRequest',
    responseType: 'customResponse',
    queryServiceMethodName: 'customService.customMethod()',
    keyName: 'customQuery'
  })
  expectCode(ast)
})
