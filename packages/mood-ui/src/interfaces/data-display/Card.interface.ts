export interface Card { 
    variant?: 'elevated' | 'outlined' | 'filled'; 
    padding?: 'none' | 'small' | 'medium' | 'large'; 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    hoverable?: boolean; 
    clickable?: boolean; 
    divided?: boolean; 
}
