export interface ButtonGroup { 
    orientation?: 'horizontal' | 'vertical'; 
    variant?: 'normal' | 'outline' | 'ghost' | 'text'; 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    size?: 'small' | 'medium' | 'large'; 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    disabled?: boolean; 
    gradient?: boolean; 
}
