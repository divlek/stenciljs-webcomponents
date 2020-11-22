import { newE2EPage } from '@stencil/core/testing';

describe('treeview-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<treeview-item></treeview-item>');
    const element = await page.find('treeview-item');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
