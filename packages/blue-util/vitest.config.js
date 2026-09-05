import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [],
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**'],
    },
    resolve: {
        alias: {
            '@blue/util': resolve(__dirname, './src'),
            // Also create aliases for deep imports
            '@blue/util/string': resolve(__dirname, './src/string'),
            '@blue/util/list': resolve(__dirname, './src/list'),
            '@blue/util/type': resolve(__dirname, './src/type'),
            '@blue/util/types': resolve(__dirname, './src/type'),
            '@blue/util/math': resolve(__dirname, './src/math'),
            '@blue/util/logic': resolve(__dirname, './src/logic'),
            '@blue/util/function': resolve(__dirname, './src/function'),
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidml0ZXN0LmNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInZpdGVzdC5jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM3QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRS9CLGVBQWUsWUFBWSxDQUFDO0lBQ3hCLElBQUksRUFBRTtRQUNGLE9BQU8sRUFBRSxJQUFJO1FBQ2IsV0FBVyxFQUFFLE9BQU87UUFDcEIsVUFBVSxFQUFFLEVBQUU7UUFDZCxPQUFPLEVBQUUsQ0FBQyxrREFBa0QsQ0FBQztRQUM3RCxPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixDQUFDO0tBQy9FO0lBQ0QsT0FBTyxFQUFFO1FBQ0wsS0FBSyxFQUFFO1lBQ0gsWUFBWSxFQUFFLE9BQU8sQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDO1lBQ3pDLHVDQUF1QztZQUN2QyxtQkFBbUIsRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQztZQUN2RCxpQkFBaUIsRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQztZQUNuRCxpQkFBaUIsRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQztZQUNuRCxrQkFBa0IsRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQztZQUNwRCxpQkFBaUIsRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQztZQUNuRCxrQkFBa0IsRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQztZQUNyRCxxQkFBcUIsRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDO1NBQzlEO0tBQ0o7Q0FDSixDQUFDLENBQUMifQ==
