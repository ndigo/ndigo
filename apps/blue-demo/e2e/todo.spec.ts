import { test, expect } from '@playwright/test';

test.describe('blue-demo todo mvc', () => {
    test('loads app and renders starter todos', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('todo-app .todoapp')).toBeVisible();
        await expect(page.locator('todo-app .todo-list todo-item')).toHaveCount(2);
    });

    test('adds and toggles a todo item', async ({ page }) => {
        await page.goto('/');

        const input = page.locator('todo-app todo-input input.new-todo');
        await input.fill('Write Playwright coverage');
        await input.press('Enter');

        const items = page.locator('todo-app .todo-list todo-item');
        await expect(items).toHaveCount(3);

        const addedItem = items.nth(2);
        await expect(addedItem.locator('label')).toHaveText('Write Playwright coverage');

        await addedItem.locator('input.toggle').click();
        await expect(addedItem.locator('li.item')).toHaveClass(/completed/);
    });
});
