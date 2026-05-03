export interface Container { 
    as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer' | 'nav'; 
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none'; 
    height?: 'auto' | 'screen' | 'fill' | 'full'; 
    centered?: boolean; 
    centerContent?: boolean; 
    padding?: 'none' | 'small' | 'medium' | 'large'; 
}
