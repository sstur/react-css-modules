/* eslint-disable react/prop-types */

import generateAppendClassName from './generateAppendClassName';
import hoistNonReactStatics from 'hoist-non-react-statics';
import makeConfiguration from './makeConfiguration';
import parseStyleName from './parseStyleName';
import React, {Children} from 'react';

/**
 * @param {ReactElement} element
 * @param {Object} styles
 * @param {Object} options
 * @returns {ReactElement}
 */
function updateProps(element: Object, styles: Object, options: Object) {
    if (element == null || typeof element !== 'object') {
        return element;
    }
    let {styleName, className, children} = element.props;
    let didUpdate = false;
    if (styleName != null) {
        let styleNames = parseStyleName(styleName, options.allowMultiple);
        let appendClassName = generateAppendClassName(styles, styleNames, options.errorWhenNotFound);
        className = className ? className + ' ' + appendClassName : appendClassName;
        didUpdate = true;
    }
    if (children != null) {
        let newChildren = [];
        let didUpdateChildren = true;
        Children.forEach(children, (child) => {
            let newChild = updateProps(child, styles, options);
            newChildren.push(newChild);
            if (newChild !== child) {
                didUpdateChildren = true;
            }
        });
        if (didUpdateChildren) {
            children = newChildren;
            didUpdate = true;
        }
    }
    if (didUpdate) {
        let props = {...element.props, className, children};
        return {...element, props};
    } else {
        return element;
    }
}

/**
 * @param {Function} Component
 * @param {Object} defaultStyles
 * @param {Object} options
 * @returns {ReactClass}
 */
export default function wrapComponent(Component: Function, defaultStyles: Object = {}, options: Object = {}) {
    class WrappedComponent extends React.Component {
        render() {
            let {props} = this;
            let {styles} = props;
            if (styles == null) {
                styles = defaultStyles;
                props = {...props, styles};
            }
            let element = React.createElement(Component, props);
            return updateProps(element, styles, makeConfiguration(options));
        }
    }
    return hoistNonReactStatics(WrappedComponent, Component);
}
