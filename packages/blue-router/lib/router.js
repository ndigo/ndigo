export class AbstractRouter {
    #interceptors;
    route;
    callback;
    addInterceptor(interceptor) {
        if (this.#interceptors.indexOf(interceptor) === -1) {
            this.#interceptors.push(interceptor);
        }
    }
}
/**
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JvdXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxNQUFNLE9BQWdCLGNBQWM7SUFDaEMsYUFBYSxDQUFzQjtJQUVuQyxLQUFLLENBQVM7SUFDZCxRQUFRLENBQWlCO0lBRXpCLGNBQWMsQ0FBQyxXQUE4QjtRQUN6QyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDakQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDekMsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQUVEO0dBQ0cifQ==