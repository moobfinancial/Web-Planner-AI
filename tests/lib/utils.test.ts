import { buttonVariants } from '@/lib/utils';

describe('buttonVariants', () => {
  it('should return default variant and size classes when no arguments are provided', () => {
    const result = buttonVariants();

    // Check for base classes (spot check)
    expect(result).toContain('inline-flex');
    expect(result).toContain('items-center');
    expect(result).toContain('justify-center');
    expect(result).toContain('rounded-md');
    expect(result).toContain('text-sm');
    expect(result).toContain('font-medium');

    // Check for default variant classes (spot check)
    expect(result).toContain('bg-primary');
    expect(result).toContain('text-primary-foreground');
    expect(result).toContain('hover:bg-primary/90');

    // Check for default size classes
    expect(result).toContain('h-10');
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
  });

  it('should return destructive variant classes when variant is destructive', () => {
    const result = buttonVariants({ variant: 'destructive' });

    expect(result).toContain('bg-destructive');
    expect(result).toContain('text-destructive-foreground');
    expect(result).toContain('hover:bg-destructive/90');
  });

  it('should return small size classes when size is sm', () => {
    const result = buttonVariants({ size: 'sm' });

    expect(result).toContain('h-9');
    expect(result).toContain('rounded-md');
    expect(result).toContain('px-3');
  });

  it('should include custom className when provided', () => {
    const customClass = 'my-custom-class';
    const result = buttonVariants({ className: customClass });

    expect(result).toContain(customClass);
  });
});
