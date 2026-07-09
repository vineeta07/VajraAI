from typing import Dict, List
import numpy as np
import pandas as pd

ID_COLS = ['TransactionID', 'TransactionDT']
TARGET = 'isFraud'

CAT_COLS = [
    'ProductCD', 'card1', 'card2', 'card3', 'card4', 'card5', 'card6',
    'addr1', 'addr2', 'P_emaildomain', 'R_emaildomain',
    'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9',
]

APP_CAT_COLS = ['department', 'location', 'vendor_id']
ALL_CAT_COLS = CAT_COLS + APP_CAT_COLS

NUM_COLS = [
    'TransactionAmt', 'dist1', 'dist2',
    'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10',
    'C11', 'C12', 'C13', 'C14',
    'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10',
    'D11', 'D12', 'D13', 'D14', 'D15',
]

APP_NUM_COLS = []

V_COLS = [f'V{i}' for i in range(1, 340)]

ID_COLS_EXTRA = [f'id_{i:02d}' for i in range(1, 39)]

HIGH_SIGNAL_ID_COLS = [
    'id_01', 'id_02', 'id_03', 'id_05', 'id_06', 'id_11',
    'id_12', 'id_13', 'id_14', 'id_15', 'id_16', 'id_17',
    'id_18', 'id_19', 'id_20', 'id_21', 'id_22', 'id_23',
    'id_24', 'id_25', 'id_26', 'id_27', 'id_28', 'id_29',
    'id_30', 'id_31', 'id_32', 'id_33', 'id_34', 'id_35',
    'id_36', 'id_37', 'id_38',
    'DeviceType', 'DeviceInfo',
]

DTYPE_MAP = {
    col: 'int32' for col in [
        'TransactionID', 'TransactionDT', 'isFraud',
    ]
}
DTYPE_MAP.update({col: 'float32' for col in [
    'card1', 'card5', 'addr1', 'addr2', 'dist1', 'dist2',
]})
DTYPE_MAP.update({col: 'float32' for col in [
    'card2', 'card3',
]})

DTYPE_MAP.update({col: 'float32' for col in [
    'TransactionAmt', 'card3',
    'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10',
    'C11', 'C12', 'C13', 'C14',
    'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10',
    'D11', 'D12', 'D13', 'D14', 'D15',
]})

DTYPE_MAP.update({f'V{i}': 'float32' for i in range(1, 340)})

DTYPE_MAP.update({f'id_{i:02d}': 'float32' for i in range(1, 39)})

DTYPE_MAP['DeviceType'] = 'category'
DTYPE_MAP['DeviceInfo'] = 'category'

for c in CAT_COLS:
    if c not in DTYPE_MAP:
        DTYPE_MAP[c] = 'category'

IDENTITY_NUM_COLS = [
    'id_01', 'id_02', 'id_03', 'id_04', 'id_05', 'id_06', 'id_07',
    'id_08', 'id_09', 'id_10', 'id_11',
    'id_13', 'id_14', 'id_17', 'id_18', 'id_19', 'id_20',
    'id_21', 'id_22', 'id_24', 'id_25', 'id_26', 'id_32',
]
IDENTITY_CAT_COLS = [
    'id_12', 'id_15', 'id_16', 'id_23', 'id_27', 'id_28', 'id_29',
    'id_30', 'id_31', 'id_33', 'id_34', 'id_35', 'id_36', 'id_37', 'id_38',
    'DeviceType', 'DeviceInfo',
]

for c in ID_COLS_EXTRA:
    if c not in DTYPE_MAP:
        DTYPE_MAP[c] = 'category'


def get_dtypes():
    return DTYPE_MAP.copy()


# ── 1. TIME FEATURES ────────────────────────────────────────────────────────

def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    dt = df['TransactionDT'].values
    hour = (dt % 86400) // 3600
    dow = (dt // 86400) % 7
    df['TransactionHour'] = hour.astype(np.float32)
    df['TransactionDayOfWeek'] = dow.astype(np.float32)
    df['HourSin'] = np.sin(2 * np.pi * hour / 24).astype(np.float32)
    df['HourCos'] = np.cos(2 * np.pi * hour / 24).astype(np.float32)
    df['DowSin'] = np.sin(2 * np.pi * dow / 7).astype(np.float32)
    df['DowCos'] = np.cos(2 * np.pi * dow / 7).astype(np.float32)
    return df


def add_time_delta_features(df: pd.DataFrame, group_col: str = 'card1') -> pd.DataFrame:
    df = df.sort_values('TransactionDT').reset_index(drop=True)
    if group_col in df.columns:
        dt_sorted = df.groupby(group_col)['TransactionDT'].diff().fillna(0).values
    else:
        dt_sorted = np.zeros(len(df))
    df['TimeDelta'] = np.log1p(np.abs(dt_sorted)).astype(np.float32)
    return df


# ── 2. TEMPORAL VELOCITY FEATURES (1h, 6h, 24h windows) ────────────────────

def add_velocity_features(df: pd.DataFrame, group_cols=None) -> pd.DataFrame:
    if group_cols is None:
        group_cols = ['card1', 'card4']

    df = df.sort_values('TransactionDT').reset_index(drop=True)

    ts = pd.to_timedelta(df['TransactionDT'].values, unit='s')
    windows = [
        ('1h', 3600),
        ('6h', 21600),
        ('24h', 86400),
    ]
    suffix = '_amt_sum'

    for gcol in group_cols:
        if gcol not in df.columns:
            continue
        for win_label, win_sec in windows:
            col_prefix = f'{gcol}_tx'
            count_col = f'{col_prefix}_count_{win_label}'
            sum_col = f'{col_prefix}{suffix}_{win_label}'

            df[count_col] = 0.0
            df[sum_col] = 0.0

            for val in df[gcol].unique():
                if pd.isna(val):
                    continue
                mask = df[gcol].values == val
                indices = np.where(mask)[0]
                if len(indices) < 2:
                    continue
                t_vals = df['TransactionDT'].values[indices]
                amt_vals = df['TransactionAmt'].values[indices]

                counts = np.zeros(len(indices), dtype=np.float32)
                sums = np.zeros(len(indices), dtype=np.float32)
                for j in range(1, len(indices)):
                    window_start = t_vals[j] - win_sec
                    k = j - 1
                    while k >= 0 and t_vals[k] >= window_start:
                        counts[j] += 1
                        sums[j] += amt_vals[k]
                        k -= 1
                df.loc[indices, count_col] = counts
                df.loc[indices, sum_col] = sums

    return df


def add_velocity_features_fast(
    df: pd.DataFrame,
    group_cols: list = None,
    windows_sec: list = None,
) -> pd.DataFrame:
    if group_cols is None:
        group_cols = ['card1']
    if windows_sec is None:
        windows_sec = [3600, 21600, 86400]

    df = df.sort_values('TransactionDT').reset_index(drop=True)
    df.index = pd.to_timedelta(df['TransactionDT'], unit='s')

    for gcol in group_cols:
        if gcol not in df.columns:
            continue
        for w in windows_sec:
            label = f'{w // 3600}h' if w % 3600 == 0 else f'{w}s'
            window_str = f'{w}s'
            count_col = f'{gcol}_tx_count_{label}'
            sum_col = f'{gcol}_amt_sum_{label}'

            grp = df.groupby(gcol)
            df[count_col] = grp['TransactionDT'].transform(
                lambda s: s.rolling(window_str, closed='left').count()
            ).fillna(0).astype(np.float32)

            df[sum_col] = grp['TransactionAmt'].transform(
                lambda s: s.rolling(window_str, closed='left').sum()
            ).fillna(0).astype(np.float32)

    df = df.reset_index(drop=True)
    return df


# ── 3. FREQUENCY ENCODER ────────────────────────────────────────────────────

class FrequencyEncoder:
    def __init__(self, min_count: int = 5):
        self.mappings: Dict = {}
        self.min_count = min_count

    def fit(self, df: pd.DataFrame, columns: List[str]):
        for col in columns:
            if col not in df.columns:
                continue
            freq = df[col].value_counts()
            freq = freq[freq >= self.min_count]
            idx = {k: i + 2 for i, k in enumerate(freq.index.to_list())}
            idx['MISSING'] = 0
            idx[np.nan] = 1
            self.mappings[col] = idx
        return self

    def transform(self, df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
        result = df.copy()
        for col in columns:
            if col not in df.columns or col not in self.mappings:
                continue
            mapping = self.mappings[col]
            result[col] = df[col].map(mapping).fillna(0).astype(np.int32)
        return result


def merge_identity(df: pd.DataFrame, identity_path: str) -> pd.DataFrame:
    id_cols_to_load = ['TransactionID'] + HIGH_SIGNAL_ID_COLS
    id_df = pd.read_csv(identity_path, usecols=id_cols_to_load)

    for col in id_df.columns:
        if col == 'TransactionID':
            continue
        missing_col = f'{col}_missing'
        id_df[missing_col] = id_df[col].isna().astype(np.float32)

        if col in IDENTITY_NUM_COLS:
            id_df[col] = pd.to_numeric(id_df[col], errors='coerce').fillna(-1).astype(np.float32)
        else:
            id_df[col] = id_df[col].fillna('UNK').astype(str)

    df = df.merge(id_df, on='TransactionID', how='left')

    for col in HIGH_SIGNAL_ID_COLS:
        missing_col = f'{col}_missing'
        if missing_col not in df.columns:
            df[missing_col] = 1.0

    return df
