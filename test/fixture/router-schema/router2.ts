import { validator, WebRouter, WebSlotManager } from '../../../src';

export const router = new WebRouter({
  prefix: '/p',
  slots: WebSlotManager.use(null),
});

router
  .get('/users')
  .query({
    projectId: validator.integer,
    name: validator.string.toLowerCase().optional().document({
      label: 'You can filter the project name',
    }),
  })
  .document(() => import('./router2.doc').then((item) => item.getUsersResponse))
  .action((ctx) => {
    ctx.body = 'Hello router1';
  });

router
  .post('/projects')
  .query({
    projectId: validator.integer,
    name: validator.string.toLowerCase().document({
      label: 'Project search name',
    }),
    description: validator.string.optional().maxLength(255),
  })
  .action((ctx) => {
    ctx.body = 'Hello router1';
    ctx.status = 201;
  });
