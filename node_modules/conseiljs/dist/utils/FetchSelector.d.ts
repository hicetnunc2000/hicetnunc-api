export default class FetchSelector {
    static actualFetch: (url: string, options: any | undefined) => any;
    static setFetch(fetch: any): void;
    static fetch: (url: string, options: any | undefined) => any;
}
