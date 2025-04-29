import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import MathView from 'react-native-math-view';
import { TypewriterText } from './TypewriterText';

interface MarkdownRendererProps {
    content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const { colors } = useTheme();

    const markdownStyles = StyleSheet.create({
        // The main container
        body: {
            color: colors.text,
            backgroundColor: '#0a0a0a',
        },

        // Headings
        heading1: {
            flexDirection: 'row',
            fontSize: 32,
            color: colors.text,
            marginVertical: 8,
        },
        heading2: {
            flexDirection: 'row',
            fontSize: 24,
            color: colors.text,
            marginVertical: 8,
        },
        heading3: {
            flexDirection: 'row',
            fontSize: 18,
            color: colors.text,
            marginVertical: 8,
        },
        heading4: {
            flexDirection: 'row',
            fontSize: 16,
            color: colors.text,
            marginVertical: 8,
        },
        heading5: {
            flexDirection: 'row',
            fontSize: 13,
            color: colors.text,
            marginVertical: 8,
        },
        heading6: {
            flexDirection: 'row',
            fontSize: 11,
            color: colors.text,
            marginVertical: 8,
        },

        // Horizontal Rule
        hr: {
            backgroundColor: colors.text,
            height: 1,
            marginVertical: 8,
        },

        // Emphasis
        strong: {
            fontWeight: 'bold',
            color: colors.text,
        },
        em: {
            fontStyle: 'italic',
            color: colors.text,
        },
        s: {
            textDecorationLine: 'line-through',
            color: colors.text,
        },

        // Blockquotes
        blockquote: {
            backgroundColor: '#1a1a1a',
            borderColor: colors.text,
            borderLeftWidth: 4,
            marginLeft: 5,
            paddingHorizontal: 5,
            marginVertical: 8,
        },

        // Lists
        bullet_list: {
            marginVertical: 8,
        },
        ordered_list: {
            marginVertical: 8,
        },
        list_item: {
            flexDirection: 'row',
            justifyContent: 'flex-start',
            marginVertical: 4,
        },
        bullet_list_icon: {
            marginLeft: 10,
            marginRight: 10,
            color: colors.text,
        },
        bullet_list_content: {
            flex: 1,
        },
        ordered_list_icon: {
            marginLeft: 10,
            marginRight: 10,
            color: colors.text,
        },
        ordered_list_content: {
            flex: 1,
        },

        // Code
        code_inline: {
            backgroundColor: '#1a1a1a',
            color: colors.codeText,
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 4,
            ...Platform.select({
                ios: {
                    fontFamily: 'Courier',
                },
                android: {
                    fontFamily: 'monospace',
                },
            }),
        },
        code_block: {
            backgroundColor: '#1a1a1a',
            color: colors.codeText,
            padding: 12,
            borderRadius: 8,
            marginVertical: 8,
            ...Platform.select({
                ios: {
                    fontFamily: 'Courier',
                },
                android: {
                    fontFamily: 'monospace',
                },
            }),
        },
        fence: {
            backgroundColor: '#1a1a1a',
            color: colors.codeText,
            padding: 12,
            borderRadius: 8,
            marginVertical: 8,
            ...Platform.select({
                ios: {
                    fontFamily: 'Courier',
                },
                android: {
                    fontFamily: 'monospace',
                },
            }),
        },

        // Tables
        table: {
            borderWidth: 1,
            borderColor: colors.text,
            borderRadius: 3,
            marginVertical: 8,
        },
        thead: {},
        tbody: {},
        th: {
            flex: 1,
            padding: 5,
            color: colors.text,
        },
        tr: {
            borderBottomWidth: 1,
            borderColor: colors.text,
            flexDirection: 'row',
        },
        td: {
            flex: 1,
            padding: 5,
            color: colors.text,
        },

        // Links
        link: {
            textDecorationLine: 'underline',
            color: colors.text,
        },
        blocklink: {
            flex: 1,
            borderColor: colors.text,
            borderBottomWidth: 1,
        },

        // Images
        image: {
            flex: 1,
        },

        // Text Output
        text: {
            color: colors.text,
        },
        textgroup: {},
        paragraph: {
            marginTop: 10,
            marginBottom: 10,
            flexWrap: 'wrap',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            width: '100%',
        },
        hardbreak: {
            width: '100%',
            height: 1,
        },
        softbreak: {},

        // Math container
        mathContainer: {
            marginVertical: 8,
            alignItems: 'center',
            backgroundColor: 'transparent',
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
                            <View key={`math-block-${node.key}`} style={markdownStyles.mathContainer}>
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
                                <TypewriterText
                                    key={`text-${node.key}-${lastIndex}-${match.index}`}
                                    text={node.content.slice(lastIndex, match.index)}
                                    style={styles.text}
                                />
                            );
                        }
                        parts.push(
                            <MathView 
                                key={`math-${node.key}-${match.index}`} 
                                math={`\\color{white}{${match[1]}}`} 
                            />
                        );
                        lastIndex = match.index + match[0].length;
                    }
                    if (lastIndex < node.content.length) {
                        parts.push(
                            <TypewriterText
                                key={`text-${node.key}-${lastIndex}-end`}
                                text={node.content.slice(lastIndex)}
                                style={styles.text}
                            />
                        );
                    }
                    if (parts.length > 0) {
                        return <View key={`container-${node.key}`}>{parts}</View>;
                    }
                    // Default text rendering with TypewriterText
                    return <TypewriterText key={`text-${node.key}`} text={node.content} style={styles.text} />;
                },
                code_inline: (node, children, parent, styles) => (
                    <Text key={`code-inline-${node.key}`} style={[styles.code_inline]}>{node.content}</Text>
                ),
                code_block: (node, children, parent, styles) => (
                    <Text 
                        key={`code-block-${node.key}`} 
                        className='text-base' 
                        style={[styles.code_block]}
                    >
                        {node.content}
                    </Text>
                ),
            }}
        >
            {content}
        </Markdown>
    );
};