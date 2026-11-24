'use strict';

const UID = 'api::article.article';
const PAGE_SIZE = 20;
const SUMMARY_FIELDS = ['title', 'slug', 'excerpt', 'date', 'publishedAt', 'updatedAt'];
const ARTICLE_FIELDS = [...SUMMARY_FIELDS, 'body', 'seoTitle', 'seoDescription'];

function summary(article) {
  return Object.fromEntries(SUMMARY_FIELDS.map((field) => [field, article[field]]));
}

module.exports = ({ strapi }) => ({
  async index(ctx) {
    const rawPage = ctx.query.page ?? '1';
    if (typeof rawPage !== 'string' || !/^[1-9]\d{0,4}$/.test(rawPage)) {
      return ctx.badRequest('Page must be a positive integer.');
    }

    const page = Number(rawPage);
    const documents = strapi.documents(UID);
    const [articles, total] = await Promise.all([
      documents.findMany({
        status: 'published',
        fields: SUMMARY_FIELDS,
        sort: ['date:desc', 'publishedAt:desc', 'slug:asc'],
        start: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      }),
      documents.count({ status: 'published' }),
    ]);

    ctx.body = {
      data: articles.map(summary),
      meta: { pagination: { page, pageSize: PAGE_SIZE, total, pageCount: Math.ceil(total / PAGE_SIZE) } },
    };
  },

  async article(ctx) {
    const { slug } = ctx.params;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) {
      return ctx.notFound('Article not found.');
    }

    const article = await strapi.documents(UID).findFirst({
      status: 'published',
      filters: { slug },
      fields: ARTICLE_FIELDS,
      populate: { cover: { fields: ['url', 'alternativeText', 'width', 'height'] } },
    });

    if (!article) return ctx.notFound('Article not found.');

    ctx.body = {
      data: {
        ...summary(article),
        body: article.body,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        cover: article.cover ? {
          url: article.cover.url,
          alternativeText: article.cover.alternativeText,
          width: article.cover.width,
          height: article.cover.height,
        } : null,
      },
    };
  },
});
