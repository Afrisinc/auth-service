import fp from 'fastify-plugin';
const prefixTagMap: Record<string, string> = {
  '/savings': 'Savings',
  '/sfcontributions': 'Socialfund contributions',
  '/sfrequests': 'Socialfund requests',
  '/sfreasons': 'Socialfund reasons',
  '/products': 'Products',
  '/ussd': 'USSD endpoints (uncommon with the rest of channels)',
};

async function attachSchemas(fastify: any) {
  fastify.addHook('onRoute', (routeOptions: { method: any; url: any; schema: any }) => {
    for (const prefix in prefixTagMap) {
      if (routeOptions.url.startsWith(prefix)) {
        routeOptions.schema = {
          ...routeOptions.schema,
          tags: [prefixTagMap[prefix]],
        };
        break;
      }
    }
  });
}
export default fp(attachSchemas);
