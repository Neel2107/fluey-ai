import { useTheme } from '@/hooks/useTheme';
import { MathService } from '@/services/MathService';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface MarkdownRendererProps {
    content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const { colors } = useTheme();

    const markdownStyles = StyleSheet.create({
        body: {
            color: colors.text,
            margin: 0,
            padding: 0,
        },
        paragraph: {
            margin: 0,
            padding: 0,
        },
        list: {
            margin: 0,
            padding: 0,
        },
        list_item: {
            margin: 0,
            padding: 0,
        },
        code_inline: {
            backgroundColor: colors.codeBackground,
            color: colors.codeText,
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 4,
        },
        code_block: {
            backgroundColor: colors.codeBackground,
            color: colors.codeText,
            padding: 12,
            borderRadius: 8,
            marginVertical: 8,
        },
        math_inline: {
            color: colors.mathText,
            backgroundColor: colors.mathBackground,
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 4,
        },
        math_block: {
            color: colors.mathText,
            backgroundColor: colors.mathBackground,
            padding: 12,
            borderRadius: 8,
            marginVertical: 8,
            textAlign: 'center',
        },
    });

    // Pre-process content to handle math expressions
    const processedContent = content
        .replace(/\$\$(.*?)\$\$/g, (_, math) => `\`\`\`math\n${math}\n\`\`\``)
        .replace(/\$(.*?)\$/g, (_, math) => `\`${math}\``);

    return (
        <Markdown
            style={markdownStyles}
            rules={{
                code_inline: (node, children, parent, styles) => {
                    if (node.content.startsWith('$') && node.content.endsWith('$')) {
                        return (
                            <MathService
                                expression={node.content}
                                style={styles.math_inline}
                            />
                        );
                    }
                    return <Text style={[styles.code_inline]}>{node.content}</Text>;
                },
                code_block: (node, children, parent, styles) => {
                    if (node.content.startsWith('math\n')) {
                        return (
                            <MathService
                                expression={node.content.slice(5)}
                                style={styles.math_block}
                            />
                        );
                    }
                    return <Text className='text-base' style={[styles.code_block]}>{node.content}</Text>;
                },
            }}
        >
            {processedContent}
        </Markdown>
    );
};