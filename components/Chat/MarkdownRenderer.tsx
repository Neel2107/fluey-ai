import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface MarkdownRendererProps {
    content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const { colors } = useTheme();

    const markdownStyles = StyleSheet.create({
        body: {
            color: colors.text,
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
        .replace(/\$\$(.*?)\$\$/g, (_, math) => `\`\`\`math\n${math}\n\`\`\``) // Block math
        .replace(/\$(.*?)\$/g, (_, math) => `\`${math}\``); // Inline math

    return (
        <Markdown
            style={markdownStyles}
            rules={{
                code_inline: (node, children, parent, styles) => {
                    // Check if this is a math expression
                    if (node.content.startsWith('$') && node.content.endsWith('$')) {
                        return (
                            <Text style={[styles.math_inline]}>
                                {node.content.slice(1, -1)}
                            </Text>
                        );
                    }
                    return <Text style={[styles.code_inline]}>{node.content}</Text>;
                },
                code_block: (node, children, parent, styles) => {
                    // Check if this is a block math expression
                    if (node.content.startsWith('math\n')) {
                        return (
                            <View style={[styles.math_block]}>
                                <Text style={{ color: colors.mathText }}>
                                    {node.content.slice(5)}
                                </Text>
                            </View>
                        );
                    }
                    return <Text style={[styles.code_block]}>{node.content}</Text>;
                },
            }}
        >
            {processedContent}
        </Markdown>
    );
}; 