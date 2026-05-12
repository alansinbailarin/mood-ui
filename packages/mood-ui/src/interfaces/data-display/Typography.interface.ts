export interface Typography { 
    variant?: 'display' | 'heading' | 'title' | 'subtitle' | 'body' | 'caption' | 'overline'; 
    size?: 'small' | 'medium' | 'large'; 
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label' | 'small' | 'strong' | 'em'; 
    weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'; 
    align?: 'left' | 'center' | 'right'; 
    color?: 'default' | 'muted' | 'primary' | 'danger' | 'success' | 'warning'; 
    truncate?: boolean; 
    italic?: boolean; 
    underline?: boolean; 
    strikethrough?: boolean; 
}
