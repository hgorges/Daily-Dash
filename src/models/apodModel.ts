import Parser from 'rss-parser';

type ApodData = {
    apodLink: string;
    apodImageLink: string;
    apodTitle: string;
};

const apodModel = {
    async getApodData(): Promise<ApodData> {
        let currentApodData: ApodData;

        try {
            const apodRssFeed = await new Parser().parseURL(
                'https://apod.com/feed.rss'
            );

            const imageUrlRegex = /<img.*?src=["'](.*?)["']/;

            currentApodData = {
                apodLink: apodRssFeed.items[0].link!,
                apodImageLink:
                    apodRssFeed.items[0]['content:encoded'].match(
                        imageUrlRegex
                    )[1],
                apodTitle: apodRssFeed.items[0].title!,
            };
        } catch {
            currentApodData = {
                apodLink: '',
                apodImageLink: '',
                apodTitle: '',
            };
        }

        return currentApodData;
    },
};

export default apodModel;
