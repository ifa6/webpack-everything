import Vue from 'vue';
import { app, router, store } from './app';
// const isDev = process.env.NODE_ENV !== 'production';
// This exported function will be called by `bundleRenderer`.
// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export default context=> {
    // set router's location
    router.push(context.url);
    const matchedComponents = router.getMatchedComponents();
    // no matched routes
    if (!matchedComponents.length) {
        return Promise.reject({
            code: '404'
        });
    }
    // Call preFetch hooks on components matched by the route.
    // A preFetch hook dispatches a store action and returns a Promise,
    // which is resolved when the action is complete and store state has been
    // updated.
    return Promise.all(matchedComponents.map(component=> {
        if (component.preFetch) {
            return component.preFetch(store);
        }
        return false;
    })).then((meta)=> {
        // After all preFetch hooks are resolved, our store is now
        // filled with the state needed to render the app.
        // Expose the state on the render context, and let the request handler
        // inline the state in the HTML response. This allows the client-side
        // store to pick-up the server-side state without having to duplicate
        // the initial data fetching on the client.
        if (meta.length && meta[0]) {
            meta = meta[0];
            if (meta.title) {
                context.title = meta.title;
            }
            if (meta.description) {
                context.description = meta.description;
            }
            if (meta.keywords) {
                context.keywords = meta.keywords;
            }
        }
        context.initialState = store.state;
        return new Vue(app);
    });
};
