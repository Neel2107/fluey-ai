export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    isStreaming?: boolean;
    characters?: {
        text: string;
        id: number;
    }[];
}