import { BehaviorSubject, Observable } from 'rxjs';

class CoinsStore {
    private balanceSubject = new BehaviorSubject<number | null>(null);

    get balance$(): Observable<number | null> {
        return this.balanceSubject.asObservable();
    }

    get currentBalance(): number | null {
        return this.balanceSubject.value;
    }

    setBalance(balance: number) {
        this.balanceSubject.next(balance);
    }
}

export const coinsStore = new CoinsStore();
