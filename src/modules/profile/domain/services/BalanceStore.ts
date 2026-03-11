import { BehaviorSubject, Observable } from 'rxjs';

class BalanceStore {
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

    clear() {
        this.balanceSubject.next(null);
    }
}

export const balanceStore = new BalanceStore();
