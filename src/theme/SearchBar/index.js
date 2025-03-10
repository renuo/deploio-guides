import React, { useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useHistory } from '@docusaurus/router';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
import { useSearchResultUrlProcessor } from '@docusaurus/theme-search-algolia/client';
import { DocSearchButton, useDocSearchKeyboardEvents } from '@docsearch/react';

let DocSearchModal = null;

function Hit({ hit, children }) {
  return <Link to={hit.url}>{children}</Link>;
}

function ResultsFooter({ state, onClose }) {
  return (
    <Link to={`/search?q=${state.query}`} onClick={onClose}>
      See all {state.context.nbHits} results
    </Link>
  );
}

function DocSearch({ contextualSearch, externalUrlProcessor }) {
  const { siteMetadata } = useDocusaurusContext();
  const processSearchResultUrl = useSearchResultUrlProcessor(externalUrlProcessor);
  const { withBaseUrl } = useBaseUrlUtils();
  const history = useHistory();
  const searchContainer = useRef(null);
  const searchButtonRef = useRef(null);

  const importDocSearchModalIfNeeded = useCallback(() => {
    if (DocSearchModal) {
      return Promise.resolve();
    }

    return Promise.all([
      import('@docsearch/react/modal'),
      import('@docsearch/react/style'),
      import('./styles.css'),
    ]).then(([{ DocSearchModal: Modal }]) => {
      DocSearchModal = Modal;
    });
  }, []);

  const onClose = useCallback(() => {
    searchContainer.current?.removeAttribute('style');
    searchButtonRef.current?.focus();
  }, []);

  const onOpen = useCallback(() => {
    importDocSearchModalIfNeeded().then(() => {
      searchContainer.current.style.position = 'relative';
      searchContainer.current.style.zIndex = 2;
    });
  }, [importDocSearchModalIfNeeded, searchContainer]);

  const onInput = useCallback(
    (event) => {
      importDocSearchModalIfNeeded().then(() => {
        searchContainer.current.style.position = 'relative';
        searchContainer.current.style.zIndex = 2;
      });
    },
    [importDocSearchModalIfNeeded, searchContainer]
  );

  const navigator = useCallback(
    ({ itemUrl }) => {
      history.push(itemUrl);
    },
    [history]
  );

  const transformItems = useCallback(
    (items) => {
      return items.map((item) => {
        const { url, ...rest } = item;
        return {
          ...rest,
          url: processSearchResultUrl(url),
        };
      });
    },
    [processSearchResultUrl]
  );

  const resultsFooterComponent = useMemo(
    () => (footerProps) => <ResultsFooter {...footerProps} onClose={onClose} />,
    [onClose]
  );

  const transformSearchClient = useCallback(
    (searchClient) => {
      searchClient.addAlgoliaAgent('docusaurus', siteMetadata.docusaurusVersion);
      return searchClient;
    },
    [siteMetadata.docusaurusVersion]
  );

  useDocSearchKeyboardEvents({
    isOpen: false,
    onOpen,
    onClose,
    onInput,
    searchButtonRef,
  });

  const { algolia } = useDocusaurusContext().siteConfig.themeConfig;

  return (
    <div className="sidebar-search-container" ref={searchContainer}>
      <DocSearchButton
        onTouchStart={importDocSearchModalIfNeeded}
        onFocus={importDocSearchModalIfNeeded}
        onMouseOver={importDocSearchModalIfNeeded}
        onClick={onOpen}
        ref={searchButtonRef}
        translations={{
          buttonText: 'Search',
          buttonAriaLabel: 'Search',
        }}
      />

      {DocSearchModal && (
        <DocSearchModal
          initialScrollY={window.scrollY}
          onClose={onClose}
          initialQuery=""
          navigator={navigator}
          transformItems={transformItems}
          hitComponent={Hit}
          transformSearchClient={transformSearchClient}
          {...algolia}
          searchParameters={{
            ...algolia.searchParameters,
            ...(contextualSearch && {
              facetFilters: [
                ...(algolia.searchParameters?.facetFilters ?? []),
                `language:${siteMetadata.i18n.currentLocale}`,
              ],
            }),
          }}
        />
      )}
    </div>
  );
}

export default function SearchBar() {
  const { siteConfig } = useDocusaurusContext();
  return <DocSearch {...siteConfig.themeConfig.algolia} />;
}