import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
export default defineConfig({
    plugins: [
        dts({
            outDir: 'lib',
            include: ['src/**/*'],
            exclude: ['**/*.spec.ts', '**/*.test.ts', '**/test/**'],
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'print',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
        },
        outDir: '.',
        emptyOutDir: false,
        sourcemap: true,
        rollupOptions: {
            external: [
                /^@blue\//,
                'reflect-metadata',
                'date-fns',
                'date-fns-tz',
                'ramda',
                'seedrandom',
                'slug',
                'objectmodel',
                /^node:.*/,
            ],
        },
        target: 'es2022',
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidml0ZS5jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ2aXRlLmNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDL0IsT0FBTyxHQUFHLE1BQU0saUJBQWlCLENBQUM7QUFFbEMsZUFBZSxZQUFZLENBQUM7SUFDeEIsT0FBTyxFQUFFO1FBQ0wsR0FBRyxDQUFDO1lBQ0EsTUFBTSxFQUFFLEtBQUs7WUFDYixPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUM7WUFDckIsT0FBTyxFQUFFLENBQUMsY0FBYyxFQUFFLGNBQWMsRUFBRSxZQUFZLENBQUM7U0FDMUQsQ0FBQztLQUNMO0lBQ0QsS0FBSyxFQUFFO1FBQ0gsR0FBRyxFQUFFO1lBQ0QsS0FBSyxFQUFFLE9BQU8sQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDO1lBQ3pDLElBQUksRUFBRSxPQUFPO1lBQ2IsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQztZQUN0QixRQUFRLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLFNBQVMsTUFBTSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUU7U0FDbEU7UUFDRCxNQUFNLEVBQUUsR0FBRztRQUNYLFdBQVcsRUFBRSxLQUFLO1FBQ2xCLFNBQVMsRUFBRSxJQUFJO1FBQ2YsYUFBYSxFQUFFO1lBQ1gsUUFBUSxFQUFFO2dCQUNOLFVBQVU7Z0JBQ1Ysa0JBQWtCO2dCQUNsQixVQUFVO2dCQUNWLGFBQWE7Z0JBQ2IsT0FBTztnQkFDUCxZQUFZO2dCQUNaLE1BQU07Z0JBQ04sYUFBYTtnQkFDYixVQUFVO2FBQ2I7U0FDSjtRQUNELE1BQU0sRUFBRSxRQUFRO0tBQ25CO0NBQ0osQ0FBQyxDQUFDIn0=