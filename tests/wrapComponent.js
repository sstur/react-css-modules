/* eslint-disable max-nested-callbacks, react/prefer-stateless-function, react/prop-types, react/no-multi-comp */

import {
    expect
} from 'chai';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import shallowCompare from 'react-addons-shallow-compare';
import jsdom from 'jsdom';
import wrapComponent from './../src/wrapComponent';

describe('wrapComponent', () => {
    beforeEach(() => {
        global.document = jsdom.jsdom('<!DOCTYPE html><html><head></head><body></body></html>');

        global.window = document.defaultView;
    });
    context('using default styles', () => {
        it('exposes styles through this.props.styles property', (done) => {
            let Component;

            const styles = {
                foo: 'foo-1'
            };

            Component = class extends React.Component {
                render() {
                    expect(this.props.styles).to.equal(styles);
                    done();
                    return null;
                }
            };

            Component = wrapComponent(Component, styles);

            TestUtils.renderIntoDocument(<Component />);
        });
        it('does not affect the other instance properties', (done) => {
            let Component;

            Component = class extends React.Component {
                render() {
                    expect(this.props.bar).to.equal('baz');
                    done();
                    return null;
                }
            };

            const styles = {
                foo: 'foo-1'
            };

            Component = wrapComponent(Component, styles);

            TestUtils.renderIntoDocument(<Component bar="baz" />);
        });
        it('does not affect pure-render logic', (done) => {
            let Component;

            let rendered = false;

            const styles = {
                foo: 'foo-1'
            };

            Component = class extends React.Component {
                shouldComponentUpdate(newProps) {
                    if (rendered) {
                        expect(shallowCompare(this.props, newProps)).to.equal(true);

                        done();
                    }

                    return true;
                }

                render() {
                    rendered = true;
                    return null;
                }
            };

            Component = wrapComponent(Component, styles);

            const instance = TestUtils.renderIntoDocument(<Component foo="bar" />);

            // trigger shouldComponentUpdate
            instance.setState({});
        });
    });
    context('overwriting default styles using "styles" property of the extended component', () => {
        it('overwrites default styles', (done) => {
            let Component;

            const styles = {
                foo: 'foo-1'
            };

            Component = class extends React.Component {
                render() {
                    expect(this.props.styles).to.equal(styles);
                    done();
                    return null;
                }
            };

            Component = wrapComponent(Component, {
                bar: 'bar-0',
                foo: 'foo-0'
            });

            TestUtils.renderIntoDocument(<Component styles={styles} />);
        });
    });
    context('rendering Component that returns null', () => {
        it('generates null element', () => {
            let Component;

            Component = class extends React.Component {
                render() {
                    return null;
                }
            };

            Component = wrapComponent(Component);

            let component = TestUtils.renderIntoDocument(<Component/>);

            expect(ReactDOM.findDOMNode(component)).to.be.null;
        });
    });
    context('target component have static properties', () => {
        it('hoists static properties', () => {
            const Component = class extends React.Component {
                static foo = 'FOO';

                render() {
                    return null;
                }
            };

            const WrappedComponent = wrapComponent(Component);

            expect(Component.foo).to.equal('FOO');
            expect(WrappedComponent.foo).to.equal(Component.foo);
        });
    });
});
