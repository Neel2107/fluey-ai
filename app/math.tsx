import { useTheme } from '@/hooks/useTheme';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MathView from 'react-native-math-view';

export default function MathScreen() {
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 16,
            backgroundColor: colors.codeBackground,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 20,
            color: colors.text,
        },
        section: {
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 12,
            color: colors.text,
        },
        backButton: {
            marginBottom: 20,
            color: colors.text,
            fontSize: 16,
        },
        mathContainer: {
            marginVertical: 8,
        },
        mathText: {
            color: colors.text,
        },
    });

    return (
        <ScrollView style={styles.container}>
            <Link href="/" style={styles.backButton}>
                ← Back to Home
            </Link>
            
            <Text style={styles.title}>Math Examples</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Inline Math Examples:</Text>
                <View style={styles.mathContainer}>
                    <Text style={styles.mathText}>
                        The quadratic formula is: {' '}
                        <MathView
                            math="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
                        />
                    </Text>
                </View>
                <View style={styles.mathContainer}>
                    <Text style={styles.mathText}>
                        Euler's identity: {' '}
                        <MathView
                            math="e^{i\pi} + 1 = 0"
                        />
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Block Math Examples:</Text>
                <View style={styles.mathContainer}>
                    <MathView
                        math="\int_{a}^{b} f(x) \, dx = F(b) - F(a)"
                    />
                </View>
                <View style={styles.mathContainer}>
                    <MathView
                        math="\sum_{i=1}^{n} i = \frac{n(n+1)}{2}"
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Complex Examples:</Text>
                <View style={styles.mathContainer}>
                    <MathView
                        math="\begin{pmatrix} a & b \\ c & d \end{pmatrix}"
                    />
                </View>
                <View style={styles.mathContainer}>
                    <MathView
                        math="\lim_{x \to \infty} \left(1 + \frac{1}{x}\right)^x = e"
                    />
                </View>
            </View>
        </ScrollView>
    );
} 