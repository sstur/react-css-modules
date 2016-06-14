import _ from 'lodash';
import wrapComponent from './wrapComponent';

/**
 * @see https://github.com/gajus/react-css-modules#options
 */
type OptionsType = {};

/**
 * When used as a function.
 */
const functionConstructor = (Component: Function, defaultStyles: Object, options: OptionsType): Function => {
    let WrappedComponent = wrapComponent(Component, defaultStyles, options);

    if (Component.displayName) {
        WrappedComponent.displayName = Component.displayName;
    } else {
        WrappedComponent.displayName = Component.name;
    }

    return WrappedComponent;
};

/**
 * When used as a ES7 decorator.
 */
const decoratorConstructor = (defaultStyles: Object, options: OptionsType): Function => {
    return (Component: Function) => {
        return functionConstructor(Component, defaultStyles, options);
    };
};

export default (...args) => {
    if (_.isFunction(args[0])) {
        return functionConstructor(args[0], args[1], args[2]);
    } else {
        return decoratorConstructor(args[0], args[1]);
    }
};
