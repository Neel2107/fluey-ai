declare module 'react-native-math-view' {
    import { ViewProps } from 'react-native';

    interface MathViewProps extends ViewProps {
        math: string;
        style?: ViewProps['style'];
    }

    const MathView: React.FC<MathViewProps>;
    export default MathView;
}