import AddIntegrationModal from '../settings/advanced/integrations/AddIntegrationModal';
import AddNewsletterModal from '../settings/email/newsletters/AddNewsletterModal';
import AddRecommendationModal from '../settings/site/recommendations/AddRecommendationModal';
import AddRecommendationModalConfirm from '../settings/site/recommendations/AddRecommendationModalConfirm';
import AmpModal from '../settings/advanced/integrations/AmpModal';
import ChangeThemeModal from '../settings/site/ThemeModal';
import CustomIntegrationModal from '../settings/advanced/integrations/CustomIntegrationModal';
import DesignModal from '../settings/site/DesignModal';
import FirstpromoterModal from '../settings/advanced/integrations/FirstPromoterModal';
import HistoryModal from '../settings/advanced/HistoryModal';
import InviteUserModal from '../settings/general/InviteUserModal';
import NavigationModal from '../settings/site/NavigationModal';
import NewsletterDetailModal from '../settings/email/newsletters/NewsletterDetailModal';
import NiceModal, {NiceModalHocProps} from '@ebay/nice-modal-react';
import PinturaModal from '../settings/advanced/integrations/PinturaModal';
import PortalModal from '../settings/membership/portal/PortalModal';
import React, {createContext, useCallback, useEffect, useRef, useState} from 'react';
import SlackModal from '../settings/advanced/integrations/SlackModal';
import StripeConnectModal from '../settings/membership/stripe/StripeConnectModal';
import TierDetailModal from '../settings/membership/tiers/TierDetailModal';
import UnsplashModal from '../settings/advanced/integrations/UnsplashModal';
import UserDetailModal from '../settings/general/UserDetailModal';
import ZapierModal from '../settings/advanced/integrations/ZapierModal';

export type RouteParams = {[key: string]: string}

export type ExternalLink = {
    isExternal: true;
    route: string;
    models?: string[] | null
};

export type InternalLink = {
    isExternal?: false;
    route: string;
}

export type RoutingContextData = {
    route: string;
    scrolledRoute: string;
    yScroll: number;
    updateRoute: (to: string | InternalLink | ExternalLink) => void;
    updateScrolled: (newPath: string) => void;
    addRouteChangeListener: (listener: RouteChangeListener) => (() => void);
};

export const RouteContext = createContext<RoutingContextData>({
    route: '',
    scrolledRoute: '',
    yScroll: 0,
    updateRoute: () => {},
    updateScrolled: () => {},
    addRouteChangeListener: () => (() => {})
});

export type RoutingModalProps = {
    params?: Record<string, string>
}

const modalPaths: {[key: string]: React.FC<NiceModalHocProps & RoutingModalProps>} = {
    'design/edit/themes': ChangeThemeModal,
    'design/edit': DesignModal,
    'navigation/edit': NavigationModal,
    'users/invite': InviteUserModal,
    'users/show/:slug': UserDetailModal,
    'portal/edit': PortalModal,
    'tiers/add': TierDetailModal,
    'tiers/show/:id': TierDetailModal,
    'stripe-connect': StripeConnectModal,
    'newsletters/add': AddNewsletterModal,
    'newsletters/show/:id': NewsletterDetailModal,
    'history/view': HistoryModal,
    'integrations/zapier': ZapierModal,
    'integrations/slack': SlackModal,
    'integrations/amp': AmpModal,
    'integrations/unsplash': UnsplashModal,
    'integrations/firstpromoter': FirstpromoterModal,
    'integrations/pintura': PinturaModal,
    'integrations/add': AddIntegrationModal,
    'integrations/show/:id': CustomIntegrationModal
};

function getHashPath(urlPath: string | undefined) {
    if (!urlPath) {
        return null;
    }
    const regex = /\/settings-x\/(.*)/;
    const match = urlPath?.match(regex);

    if (match) {
        const afterSettingsX = match[1];
        return afterSettingsX;
    }
    return null;
}

const scrollToSectionGroup = (pathName: string) => {
    const element = document.getElementById(pathName);
    if (element) {
        element.scrollIntoView({behavior: 'smooth'});
    }
};

const handleNavigation = (scroll: boolean = true) => {
    // Get the hash from the URL
    let hash = window.location.hash;

    // Remove the leading '#' character from the hash
    hash = hash.substring(1);

    // Get the path name from the hash
    const pathName = getHashPath(hash);

    if (pathName) {
        const [path, modal] = Object.entries(modalPaths).find(([modalPath]) => matchRoute(pathName, modalPath)) || [];

        if (path && modal) {
            NiceModal.show(modal, {params: matchRoute(pathName, path)});
        }

        if (pathName === 'design/edit/themes') {
            NiceModal.show(ChangeThemeModal);
        } else if (pathName === 'design/edit') {
            NiceModal.show(DesignModal);
        } else if (pathName === 'navigation/edit') {
            NiceModal.show(NavigationModal);
        } else if (pathName === 'users/invite') {
            NiceModal.show(InviteUserModal);
        } else if (pathName === 'portal/edit') {
            NiceModal.show(PortalModal);
        } else if (pathName === 'tiers/add') {
            NiceModal.show(TierDetailModal);
        } else if (pathName === 'stripe-connect') {
            NiceModal.show(StripeConnectModal);
        } else if (pathName === 'newsletters/add') {
            NiceModal.show(AddNewsletterModal);
        } else if (pathName === 'history/view') {
            NiceModal.show(HistoryModal);
        } else if (pathName === 'integrations/zapier') {
            NiceModal.show(ZapierModal);
        } else if (pathName === 'integrations/slack') {
            NiceModal.show(SlackModal);
        } else if (pathName === 'integrations/amp') {
            NiceModal.show(AmpModal);
        } else if (pathName === 'integrations/unsplash') {
            NiceModal.show(UnsplashModal);
        } else if (pathName === 'integrations/firstpromoter') {
            NiceModal.show(FirstpromoterModal);
        } else if (pathName === 'integrations/pintura') {
            NiceModal.show(PinturaModal);
        } else if (pathName === 'integrations/add') {
            NiceModal.show(AddIntegrationModal);
        } else if (pathName === 'recommendations/add') {
            NiceModal.show(AddRecommendationModal);
        } else if (pathName === 'recommendations/add-confirm') {
            NiceModal.show(AddRecommendationModalConfirm);
        }

        if (scroll) {
            scrollToSectionGroup(pathName);
        }

        return pathName;
    }
    return '';
};

const matchRoute = (pathname: string, routeDefinition: string) => {
    const regex = new RegExp(routeDefinition.replace(/:(\w+)/, '(?<$1>[^/]+)'));

    return pathname.match(regex)?.groups;
};

const callRouteChangeListeners = (newPath: string, listeners: RouteChangeListener[]) => {
    listeners.forEach((listener) => {
        const params = matchRoute(newPath, listener.route);

        if (params) {
            listener.callback(params);
        }
    });
};

type RouteProviderProps = {
    externalNavigate: (link: ExternalLink) => void;
    children: React.ReactNode;
};

type RouteChangeListener = {
    route: string;
    callback: (params: RouteParams) => void;
}

const RoutingProvider: React.FC<RouteProviderProps> = ({externalNavigate, children}) => {
    const [route, setRoute] = useState<string>('');
    const [yScroll, setYScroll] = useState(0);
    const [scrolledRoute, setScrolledRoute] = useState<string>('');
    const routeChangeListeners = useRef<RouteChangeListener[]>([]);

    const updateRoute = useCallback((to: string | InternalLink | ExternalLink) => {
        const options = typeof to === 'string' ? {route: to} : to;

        if (options.isExternal) {
            externalNavigate(options);
            return;
        }

        const newPath = options.route;

        if (newPath) {
            if (newPath === route) {
                scrollToSectionGroup(newPath);
            } else {
                window.location.hash = `/settings-x/${newPath}`;
            }
        } else {
            window.location.hash = `/settings-x`;
        }
    }, [externalNavigate, route]);

    const updateScrolled = useCallback((newPath: string) => {
        setScrolledRoute(newPath);
    }, []);

    useEffect(() => {
        const handleHashChange = () => {
            const matchedRoute = handleNavigation();
            setRoute(matchedRoute);
            callRouteChangeListeners(matchedRoute, routeChangeListeners.current);
        };

        const handleScroll = () => {
            const element = document.getElementById('admin-x-root');
            const scrollPosition = element!.scrollTop;
            setYScroll(scrollPosition);
        };

        const element = document.getElementById('admin-x-root');
        const matchedRoute = handleNavigation();
        setRoute(matchedRoute);
        callRouteChangeListeners(matchedRoute, routeChangeListeners.current);
        element!.addEventListener('scroll', handleScroll);

        window.addEventListener('hashchange', handleHashChange);

        return () => {
            element!.removeEventListener('scroll', handleScroll);
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const addRouteChangeListener = useCallback((listener: RouteChangeListener) => {
        if (route && !routeChangeListeners.current.some(current => current.route === listener.route)) {
            callRouteChangeListeners(route, [listener]);
        }

        routeChangeListeners.current = [...routeChangeListeners.current, listener];

        return () => routeChangeListeners.current = routeChangeListeners.current.filter(current => current !== listener);
    }, [route]);

    return (
        <RouteContext.Provider
            value={{
                route,
                scrolledRoute,
                yScroll,
                updateRoute,
                updateScrolled,
                addRouteChangeListener
            }}
        >
            {children}
        </RouteContext.Provider>
    );
};

export default RoutingProvider;
