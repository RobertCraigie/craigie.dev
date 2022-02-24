from typing import Tuple, Any
from typing_extensions import Unpack, TypeVarTuple, reveal_type


FieldT = TypeVarTuple('FieldT')


class Field:
    name: str

    def __init__(self, name: str) -> None:
        self.name = name


def field(*, name: str) -> Any:
    return Field(name=name)


fake_db = [
    {
        'id': 1,
        'name': 'Robert',
        'email': 'robert@craigie.dev',
        'hashed_password': 'foo',
    },
    {
        'id': 2,
        'name': 'Tegan',
        'email': 'tegan@craigie.dev',
        'hashed_password': 'bar',
    },
]


class User:
    id: int = field(name='id')
    name: str = field(name='name')
    email: str = field(name='email')
    hashed_password: str = field(name='hashed_password')

    @classmethod
    def select(cls, *fields: Unpack[FieldT]) -> Tuple[Unpack[FieldT]]:
        if any(not isinstance(field, Field) for field in fields):
            raise TypeError(
                'Expected all select arguments to be an instance of Field'
            )

        # for simplicites sake we'll just take the first record
        user = fake_db[0]

        # we have to add a type: ignore comment here as the type checker
        # cannot understand the relationship between this expression
        # and the input.
        return tuple(  # type: ignore
            user[field.name] for field in fields if isinstance(field, Field)
        )


user = User.select(User.name, User.id)
reveal_type(user)  # Revealed type is Tuple[str, int]
print(user)        # ('Robert', 1)
