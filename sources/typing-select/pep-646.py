from typing import Tuple
from typing_extensions import TypeVarTuple, Unpack


T = TypeVarTuple('T')


def insert_int(seq: Tuple[Unpack[T]]) -> Tuple[int, Unpack[T]]:
    ...


insert_int(('a', 1))  # return type: Tuple[int, str, int]
