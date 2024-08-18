import Parser from 'rss-parser';

type NewsData = {
    newsDescription: string;
    newsEntries: {
        headline: string;
        link: string;
    }[];
};

const newsModel = {
    async getNewsData(): Promise<NewsData> {
        const newsRssFeed = await new Parser().parseURL(
            'https://www.tagesschau.de/index~rss2.xml',
        );

        return {
            newsDescription: newsRssFeed.description!,
            newsEntries: newsRssFeed.items
                .map((item) => {
                    return {
                        headline: item.title!,
                        link: item.link!,
                    };
                })
                .slice(0, 6),
        };
    },
};

export default newsModel;
