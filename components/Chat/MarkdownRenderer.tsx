import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Markdown, { ASTNode } from 'react-native-markdown-display';
import MathView from 'react-native-math-view';

interface MarkdownRendererProps {
    content: string;
}

// Define the type for the parent node
interface ParentNode {
    children: ASTNode[];
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
            fontWeight: 'bold',
        },
        heading2: {
            flexDirection: 'row',
            fontSize: 24,
            color: colors.text,
            marginVertical: 8,
            fontWeight: 'bold',
        },
        heading3: {
            flexDirection: 'row',
            fontSize: 18,
            color: colors.text,
            marginVertical: 8,
            fontWeight: 'bold',
        },
        heading4: {
            flexDirection: 'row',
            fontSize: 16,
            color: colors.text,
            marginVertical: 8,
            fontWeight: 'bold',
        },
        heading5: {
            flexDirection: 'row',
            fontSize: 13,
            color: colors.text,
            marginVertical: 8,
            fontWeight: 'bold',
        },
        heading6: {
            flexDirection: 'row',
            fontSize: 11,
            color: colors.text,
            marginVertical: 8,
            fontWeight: 'bold',
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
            fontWeight: 'bold',
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
            fontSize: 16,
            lineHeight: 24,
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
                    // Render inline math within text
                    const regex = /\$(.+?)\$/g;
                    const parts = [];
                    let lastIndex = 0;
                    let match;
                    while ((match = regex.exec(node.content)) !== null) {
                        if (match.index > lastIndex) {
                            parts.push(
                                <Text
                                    key={`text-${node.key}-${lastIndex}-${match.index}`}
                                    style={styles.text}
                                >
                                    {node.content.slice(lastIndex, match.index)}
                                </Text>
                            );
                        }
                        parts.push(
                            <MathView 
                                key={`math-inline-${node.key}-${match.index}`} 
                                math={match[1]} 
                                style={{ marginHorizontal: 2 }}
                            />
                        );
                        lastIndex = match.index + match[0].length;
                    }
                    if (lastIndex < node.content.length) {
                        parts.push(
                            <Text
                                key={`text-${node.key}-${lastIndex}-end`}
                                style={styles.text}
                            >
                                {node.content.slice(lastIndex)}
                            </Text>
                        );
                    }
                    if (parts.length > 0) {
                        return <Text key={`container-${node.key}`} style={styles.text}>{parts}</Text>;
                    }
                    // Default text rendering
                    return <Text key={`text-${node.key}`} style={styles.text}>{node.content}</Text>;
                },
                paragraph: (node, children, parent, styles) => {
                    // Block math: if the paragraph is only a block math expression
                    const blockMathMatch = node.content.match(/^\s*\$\$([\s\S]+?)\$\$\s*$/m);
                    if (blockMathMatch) {
                        return (
                            <View key={`math-block-${node.key}`} style={markdownStyles.mathContainer}>
                                <MathView math={blockMathMatch[1]} style={{ marginVertical: 4 }} />
                            </View>
                        );
                    }
                    return (
                        <View key={`paragraph-${node.key}`} style={styles.paragraph}>
                            <Text style={styles.text}>{children}</Text>
                        </View>
                    );
                },
                strong: (node, children, parent, styles) => (
                    <Text key={`strong-${node.key}`} style={[styles.text, styles.strong]}>{children}</Text>
                ),
                em: (node, children, parent, styles) => (
                    <Text key={`em-${node.key}`} style={[styles.text, styles.em]}>{children}</Text>
                ),
                s: (node, children, parent, styles) => (
                    <Text key={`s-${node.key}`} style={[styles.text, styles.s]}>{children}</Text>
                ),
                code_inline: (node, children, parent, styles) => (
                    <Text key={`code-inline-${node.key}`} style={[styles.text, styles.code_inline]}>{node.content}</Text>
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
                heading1: (node, children, parent, styles) => (
                    <View key={`heading1-${node.key}`} style={styles.heading1}>
                        {children}
                    </View>
                ),
                heading2: (node, children, parent, styles) => (
                    <View key={`heading2-${node.key}`} style={styles.heading2}>
                        {children}
                    </View>
                ),
                heading3: (node, children, parent, styles) => (
                    <View key={`heading3-${node.key}`} style={styles.heading3}>
                        {children}
                    </View>
                ),
                heading4: (node, children, parent, styles) => (
                    <View key={`heading4-${node.key}`} style={styles.heading4}>
                        {children}
                    </View>
                ),
                heading5: (node, children, parent, styles) => (
                    <View key={`heading5-${node.key}`} style={styles.heading5}>
                        {children}
                    </View>
                ),
                heading6: (node, children, parent, styles) => (
                    <View key={`heading6-${node.key}`} style={styles.heading6}>
                        {children}
                    </View>
                ),
                blockquote: (node, children, parent, styles) => (
                    <View key={`blockquote-${node.key}`} style={styles.blockquote}>
                        {children}
                    </View>
                ),
                bullet_list: (node, children, parent, styles) => (
                    <View key={`bullet-list-${node.key}`} style={styles.bullet_list}>
                        {children}
                    </View>
                ),
                ordered_list: (node, children, parent, styles) => (
                    <View key={`ordered-list-${node.key}`} style={styles.ordered_list}>
                        {children}
                    </View>
                ),
                list_item: (node, children, parent, styles) => (
                    <View key={`list-item-${node.key}`} style={styles.list_item}>
                        {children}
                    </View>
                ),
                bullet_list_icon: (node, children, parent, styles) => (
                    <Text key={`bullet-icon-${node.key}`} style={styles.bullet_list_icon}>•</Text>
                ),
                ordered_list_icon: (node, children, parent, styles) => (
                    <Text key={`ordered-icon-${node.key}`} style={styles.ordered_list_icon}>{node.index + 1}.</Text>
                ),
                bullet_list_content: (node, children, parent, styles) => (
                    <View key={`bullet-content-${node.key}`} style={styles.bullet_list_content}>
                        {children}
                    </View>
                ),
                ordered_list_content: (node, children, parent, styles) => (
                    <View key={`ordered-content-${node.key}`} style={styles.ordered_list_content}>
                        {children}
                    </View>
                ),
                link: (node, children, parent, styles) => (
                    <Text key={`link-${node.key}`} style={styles.link}>{children}</Text>
                ),
                hr: (node, children, parent, styles) => (
                    <View key={`hr-${node.key}`} style={styles.hr} />
                ),
            }}
        >
            {content}
        </Markdown>
    );
};