import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import MathView from 'react-native-math-view';

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
        mathContainer: {
            marginVertical: 8,
            alignItems: 'center',
            backgroundColor: 'transparent',
        },
        text: {
            color: colors.text,
            fontSize: 18,
            marginBottom: 8,
        },
    });

    return (
        <Markdown
            style={markdownStyles}
            rules={{
                text: (node, children, parent, styles) => {
                    // Render block math if present
                    const blockMatch = node.content.match(/^\s*\$\$([\s\S]+?)\$\$\s*$/m);
                    if (blockMatch) {
                        return (
                            <View style={markdownStyles.mathContainer}>
                                <MathView math={`\\color{white}{${blockMatch[1]}}`} />
                            </View>
                        );
                    }
                    // Render inline math if present
                    const parts = [];
                    let lastIndex = 0;
                    const regex = /\$(.+?)\$/g;
                    let match;
                    while ((match = regex.exec(node.content)) !== null) {
                        if (match.index > lastIndex) {
                            parts.push(
                                <Text key={`text-${lastIndex}-${match.index}`} style={styles.text}>
                                    {node.content.slice(lastIndex, match.index)}
                                </Text>
                            );
                        }
                        parts.push(
                            <MathView key={`math-${match.index}`} math={`\\color{white}{${match[1]}}`} />
                        );
                        lastIndex = match.index + match[0].length;
                    }
                    if (lastIndex < node.content.length) {
                        parts.push(
                            <Text key={`text-${lastIndex}-end`} style={styles.text}>
                                {node.content.slice(lastIndex)}
                            </Text>
                        );
                    }
                    if (parts.length > 0) {
                        return <>{parts}</>;
                    }
                    // Default text rendering
                    return <Text style={styles.text}>{node.content}</Text>;
                },
                code_inline: (node, children, parent, styles) => (
                    <Text style={[styles.code_inline]}>{node.content}</Text>
                ),
                code_block: (node, children, parent, styles) => (
                    <Text className='text-base' style={[styles.code_block]}>{node.content}</Text>
                ),
            }}
        >
            {content}
        </Markdown>
    );
};