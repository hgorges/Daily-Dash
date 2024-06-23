import Parser from 'rss-parser';

type ApodData = {
    apodLink: string;
    apodImageLink: string;
    apodTitle: string;
};

const apodModel = {
    async getApodData(): Promise<ApodData> {
        const apodRssFeed = await new Parser().parseURL(
            'https://apod.com/feed.rss'
        );

        const imageUrlRegex = /<img.*?src=["'](.*?)["']/;

        return {
            apodLink: apodRssFeed.items[0].link!,
            apodImageLink:
                apodRssFeed.items[0]['content:encoded'].match(imageUrlRegex)[1],
            apodTitle: apodRssFeed.items[0].title!,
        };
    },
};

export default apodModel;
