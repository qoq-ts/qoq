import { finder } from '../util/finder';
import { WebRouterSchema } from './WebBuilder';
import { WebRouter } from './WebRouter';

export const generateRouterSchemas = async (
  routerPath: finder.Paths,
): Promise<WebRouterSchema[]> => {
  const routers: WebRouterSchema[] = [];
  const matches = await finder(finder.normalize(routerPath));

  await Promise.all(
    matches.map((matchPath) => {
      return import(matchPath).then((modules) => {
        return Promise.all(
          Object.values(modules).map(async (item) => {
            if (item && item instanceof WebRouter) {
              for (let builder of item.builders) {
                routers.push(await builder.toJSON());
              }
            }
          }),
        );
      });
    }),
  );

  return routers;
};
